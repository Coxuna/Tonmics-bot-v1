import { useState, useEffect } from "react"

export default function ResponsivePadding({ children }) {
  const [paddingTop, setPaddingTop] = useState("1rem")
  const [paddingBottom, setPaddingBottom] = useState("1rem")
  const [wheelScale, setWheelScale] = useState(1)
  const [statusCardScale, setStatusCardScale] = useState(1)

  useEffect(() => {
    // This code only runs in the browser after component mounts
    const updatePadding = () => {
      const height = window.innerHeight
      const width = window.innerWidth

      // Adjust top padding based on screen height
      if (height >= 1100) {
        setPaddingTop("8rem")
      } else if (height >= 1000) {
        setPaddingTop("6rem")
      } else if (height >= 800) {
        setPaddingTop("5rem")
      } else if (height >= 700) {
        setPaddingTop("3rem")
      } else {
        setPaddingTop("1rem")
      }

      // Adjust bottom padding based on screen height
      if (height <= 700) {
        setPaddingBottom("0.5rem")
      } else if (height >= 1000) {
        setPaddingBottom("1.5rem")
      } else {
        setPaddingBottom("1rem")
      }

      // Scale wheel and status cards based on screen size
      if (height <= 600) {
        setWheelScale(0.8)
        setStatusCardScale(0.9)
      } else if (height <= 700) {
        setWheelScale(0.9)
        setStatusCardScale(0.95)
      } else {
        setWheelScale(1)
        setStatusCardScale(1)
      }
    }

    // Initial call
    updatePadding()

    // Update on resize
    window.addEventListener("resize", updatePadding)

    // Cleanup
    return () => window.removeEventListener("resize", updatePadding)
  }, [])

  return (
    <div
      style={{
        height: "calc(100vh - 56px)",
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden"
      }}
    >
      {/* Clone children and pass additional props for scaling */}
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          wheelScale, 
          statusCardScale 
        })
      )}
    </div>
  )
}