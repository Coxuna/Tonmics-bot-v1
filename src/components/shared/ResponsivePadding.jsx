

import { useState, useEffect } from "react"

export default function ResponsivePadding({ children }) {
  const [paddingTop, setPaddingTop] = useState("1rem")
  const [paddingBottom, setPaddingBottom] = useState("1rem")

  useEffect(() => {
    // This code only runs in the browser after component mounts
    const updatePadding = () => {
      const height = window.innerHeight

      // Set top padding based on screen height
      if (height >= 1100) {
        setPaddingTop("8rem")
      } else if (height >= 1000) {
        setPaddingTop("6rem")
      } else if (height >= 800) {
        setPaddingTop("5rem")
      } else {
        setPaddingTop("1rem")
      }

      // Set bottom padding based on screen height
      if (height <= 700) {
        setPaddingBottom("0.5rem")
      } else if (height >= 1000) {
        setPaddingBottom("1.5rem")
      } else {
        setPaddingBottom("1rem")
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
      }}
    >
      {children}
    </div>
  )
}

