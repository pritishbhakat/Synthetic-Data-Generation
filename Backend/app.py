from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
import os
import io
import pandas as pd
from sdv.metadata import SingleTableMetadata
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.evaluation.single_table import evaluate_quality
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# s3 config
s3 = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name='ap-south-1', 
    config=Config(signature_version='s3v4')
)

# global variables
real_data_df = None
meta_data = {}
synthetic_data_df = None
synthetic_data_score = 0
real_data_file_name = "real/"
synthetic_data_file_name = "real/synthetic-"

# /api/get-object-url : get the object using key
@app.route('/api/get-object-url', methods=['GET'])
def api_get_object_url():
    data = request.json
    key = data['key']
    url = get_object_url(key)
    return {'url': url}

def get_object_url(key):
    try:
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': 'sdp-sythetic-data', 'Key': key},
            ExpiresIn=3600  # URL expiration time in seconds
        )
        return url
    except ClientError as e:
        print(e)
        return None

# /api/put-object-url : upload excel file using PUT Method
@app.route('/api/put-object-url', methods=['GET', 'POST'])
def api_put_object_url():
    global real_data_file_name, synthetic_data_file_name

    filename = request.json.get('filename')
    real_data_file_name = real_data_file_name + filename
    synthetic_data_file_name = synthetic_data_file_name + filename
    print(real_data_file_name)
    content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    url = put_object_url(filename, content_type)
    return {'url': url}

def put_object_url(filename, content_type):
    try:
        url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': 'sdp-sythetic-data', 'Key': f'real/{filename}', 'ContentType': content_type},
            ExpiresIn=36000  # URL expiration time in seconds
        )
        return url
    except ClientError as e:
        print(e)
        return None

# /api/generate-metadata
@app.route('/api/generate-metadata', methods=['GET'])
def api_generate_metadata():
    read_xlsx_from_s3(real_data_file_name)
    get_meta_data()
    return {'metadata': meta_data.to_dict()}

# extracting excel file from s3 bucket and converting it into pandas data frame
def read_xlsx_from_s3(key):
    global real_data_df
    try:
        response = s3.get_object(
            Bucket='sdp-sythetic-data',
            Key=key
        )
        excel_data = response['Body'].read()
        df = pd.read_excel(io.BytesIO(excel_data), engine='openpyxl')
        real_data_df = df
        return df
    except Exception as e:
        print(e)
        return None

# generate metadata using SingleTableMetaData() function
def get_meta_data():
    global meta_data
    meta_data = SingleTableMetadata()
    meta_data.detect_from_dataframe(real_data_df)

# /api/update-metadata
@app.route('/api/update-metadata', methods=['POST'])
def api_update_metadata():
    data = request.json
    modify_meta_data(data)
    return {'message': 'updated metadata successfully'}

def modify_meta_data(data):
    global meta_data
    for col_name in data.keys():
        mod_sdtype = data[col_name]['sdtype']
        mod_pii = data[col_name]['pii']
        if mod_sdtype == "datetime":
            meta_data.update_column(
                column_name=col_name,
                sdtype='datetime'
            )
        elif mod_sdtype == "numerical":
            continue
            meta_data.update_column(
                column_name=col_name,
                sdtype=mod_sdtype
            )
        elif mod_sdtype in ["email", "name", "phone_number", "credit_card_number"]:
            meta_data.update_column(
                column_name=col_name,
                sdtype=mod_sdtype,
                pii=mod_pii
            )
        else:
            meta_data.update_column(
                column_name=col_name,
                sdtype=mod_sdtype
            )

# /api/generate-synthetic-data
@app.route('/api/generate-synthetic-data', methods=['GET','POST'])
def api_generate_synthetic_data():
    global synthetic_data_file_name
    data = request.json
    no_of_rows = int(data['rows'])
    synthetize_data(no_of_rows)
    convert_and_upload_to_s3(synthetic_data_file_name)
    return {'message': 'generated synthetic data successfully'}

def synthetize_data(rows):
    global synthetic_data_df

    synthesizer = GaussianCopulaSynthesizer(meta_data)
    synthesizer.fit(real_data_df)

    synthetic_data_df = synthesizer.sample(num_rows=rows)

def convert_and_upload_to_s3(key):
    global synthetic_data_df
    # Convert synthetic data to DataFrame
    df = pd.DataFrame(synthetic_data_df)

    # Convert DataFrame to Excel format
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)

    try:
        s3.upload_fileobj(excel_buffer, 'sdp-sythetic-data', key)
        print("File uploaded successfully to S3 bucket:", 'sdp-sythetic-data', "with key:", key)
        return True
    except Exception as e:
        print("Error uploading file to S3:", e)
        return False

# /api/get-synthetic-score
@app.route('/api/get-synthetic-score', methods=['GET'])
def get_synthetic_score():
    global real_data_df, synthetic_data_df, synthetic_data_score, meta_data
    # # Ensure all columns are numeric if they are supposed to be
    # real_data_df = real_data_df.apply(pd.to_numeric, errors='ignore')
    # synthetic_data_df = synthetic_data_df.apply(pd.to_numeric, errors='ignore')
    try:
        quality_report = evaluate_quality(
            real_data=real_data_df,
            synthetic_data=synthetic_data_df,
            metadata=meta_data
        )
        synthetic_data_score = round(quality_report.get_score() * 100, 2)
    except Exception as e:
        print(e)
    print("synthetic score", synthetic_data_score)
    return {'synthetic_score': synthetic_data_score}

# /api/download-synthetic-data : download generated synthetic data
@app.route('/api/download-synthetic-data', methods=['GET'])
def api_download_synthetic_data():
    url = download_object(synthetic_data_file_name)
    return jsonify({'url': url})

def download_object(key):
    try:
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': 'sdp-sythetic-data', 'Key': key},
            ExpiresIn=3600  # URL expiration time in seconds
        )
        return url
    except ClientError as e:
        print(e)
        return None

# /api/delete-user-data : delete your data from our database
@app.route('/api/delete-user-data', methods=['DELETE'])
def api_delete_user_data():
    delete_object(real_data_file_name)
    delete_object(synthetic_data_file_name)
    return {'message': 'Objects deleted successfully'}

def delete_object(key):
    try:
        s3.delete_object(
            Bucket='sdp-sythetic-data',
            Key=key
        )
    except ClientError as e:
        print(e)
        return None

# /api/reset-metadata : reset all metadata and data
@app.route('/api/reset-metadata', methods=['GET'])
def api_reset_metadata():
    global meta_data, real_data_df, synthetic_data_df, real_data_file_name, synthetic_data_file_name, synthetic_data_score
    real_data_df = None
    meta_data = {}
    synthetic_data_df = None
    synthetic_data_score = 0
    real_data_file_name = "real/"
    synthetic_data_file_name = "real/synthetic-"
    print(real_data_df, real_data_file_name, synthetic_data_df, synthetic_data_file_name, meta_data)
    return {"message": "reset everything successfully"}

# if __name__ == '__main__':
#     app.run(debug=True)
