import React, { useState, useEffect, useCallback } from 'react'
import { Gamepad2 } from 'lucide-react'
import { Button } from './ui/button'

type Position = {
  x: number
  y: number
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }

export const Snake: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [gameOver, setGameOver] = useState(false)

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFood(newFood)
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setGameOver(false)
    generateFood()
  }, [generateFood])

  const checkCollision = useCallback(
    (head: Position) => {
      return (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        snake.some((segment) => segment.x === head.x && segment.y === head.y)
      )
    },
    [snake]
  )

  const moveSnake = useCallback(() => {
    if (gameOver) return

    const newSnake = [...snake]
    const head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y
    }

    if (checkCollision(head)) {
      setGameOver(true)
      return
    }

    newSnake.unshift(head)

    if (head.x === food.x && head.y === food.y) {
      generateFood()
    } else {
      newSnake.pop()
    }

    setSnake(newSnake)
  }, [snake, direction, food, gameOver, checkCollision, generateFood])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) {
        setIsPlaying(true)
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 })
          break
        case 'r':
          resetGame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, isPlaying, resetGame])

  useEffect(() => {
    if (!isPlaying) return

    const gameLoop = setInterval(moveSnake, 150)
    return () => clearInterval(gameLoop)
  }, [isPlaying, moveSnake])

  if (!isPlaying) {
    return (
      <Gamepad2
        className="w-10 h-10 hover:text-green-500 transition-color ease-in-out duration-200"
        onClick={() => setIsPlaying(true)}
      />
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="relative bg-card rounded-md border overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE
            }}
          />
        ))}
        <div
          className="absolute bg-red-500"
          style={{
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE
          }}
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <Button className="" onClick={resetGame}>
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
