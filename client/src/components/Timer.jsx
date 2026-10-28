import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({ timeLeft, totalTime }) {
    const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0
    const hours = Math.floor(timeLeft / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    const seconds = timeLeft % 60
    const formattedTime = hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar
        value={percentage}
        text={formattedTime}
        styles={buildStyles({
          textSize: hours > 0 ? "18px" : "24px",
          pathColor: "#10b981",
          textColor: "#ef4444",
          trailColor: "#e5e7eb",
        })}
        />
      
    </div>
  )
}

export default Timer