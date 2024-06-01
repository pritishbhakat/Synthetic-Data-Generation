import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function Spinner() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </React.Fragment>
  );
}

// export default function CustomizedProgressBars() {
//   return (
//     <Stack spacing={2} sx={{ flexGrow: 1 }}>
//       <FacebookCircularProgress />
//       <GradientCircularProgress />
//       <br />
//       <BorderLinearProgress variant="determinate" value={50} />
//     </Stack>
//   );
// }
