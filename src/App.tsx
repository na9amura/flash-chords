import { useReducer } from 'react'
import { reducer, initialState } from './core/session'
import { ensureAudio } from './audio/player'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Result from './components/Result'
import Review from './components/Review'

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const start = (difficultyId: string) => {
    void ensureAudio() // ユーザー操作内でAudioContextをresume(iOS Safari)
    dispatch({ type: 'start', difficultyId })
  }

  return (
    <main className="app">
      {state.screen === 'home' && <Home initialDifficultyId={state.difficultyId} onStart={start} />}
      {state.screen === 'quiz' && <Quiz state={state} dispatch={dispatch} />}
      {state.screen === 'result' && <Result state={state} dispatch={dispatch} />}
      {state.screen === 'review' && <Review state={state} dispatch={dispatch} />}
    </main>
  )
}
