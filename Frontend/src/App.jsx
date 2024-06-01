import React from 'react'
import {Routes,Route} from 'react-router-dom'
import {Intro,Home,Metadata,Result,Synthesize} from './pages'

function App() {
 
  return (
    <Routes>
      <Route path='/' element={<Intro/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/metadata' element={<Metadata/>}/>
      <Route path='/synthesize' element={<Synthesize/>}/>
      <Route path='/result' element={<Result/>}/>
    </Routes>
  )
}

export default App
