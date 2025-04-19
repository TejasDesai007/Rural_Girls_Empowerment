"use client";

import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

// Define the context
const MouseEnterContext = createContext({
  mouseX: null,
  mouseY: null,
  setMouseX: () => {},
  setMouseY: () => {},
});

export const CardContainer = ({
  children,
  className,
  containerClassName,
}) => {
  const containerRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  // Function to manage mouse position
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position from the center of the element and normalize between -0.5 and 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMouseX(x);
    setMouseY(y);
  };

  // Reset mouse position when not hovering
  const handleMouseLeave = () => {
    setMouseX(null);
    setMouseY(null);
  };

  return (
    <MouseEnterContext.Provider value={{ mouseX, mouseY, setMouseX, setMouseY }}>
      <div
        className={`${containerClassName || ""} relative`}
        style={{
          perspective: "1000px",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        <div
          className={`${className || ""} relative transition-all duration-200 ease-linear`}
          style={{
            transform: mouseX !== null && mouseY !== null
              ? `rotateY(${mouseX * 20}deg) rotateX(${mouseY * -20}deg)`
              : "rotateY(0deg) rotateX(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}) => {
  return (
    <div
      className={`${className || ""} h-full w-full`}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
}) => {
  const { mouseX, mouseY } = useContext(MouseEnterContext);
  const ref = useRef(null);
  
  useEffect(() => {
    // Don't apply any transform if mouse is not over the card
    if (mouseX === null || mouseY === null || !ref.current) return;
    
    // Base translation values from props
    const itemZ = typeof translateZ === 'number' ? translateZ : parseInt(translateZ);
    
    // Apply transform based on mouse position and Z value
    ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${itemZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
  }, [mouseX, mouseY, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <div
      ref={ref}
      className={`${className || ""} transition-transform duration-200 ease-linear`}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};