import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';

function GSAPText() {
  const el = useRef();

  useLayoutEffect(() => {
    gsap.fromTo(el.current, 
      { opacity: 0, y: 100 }, 
      { opacity: 1, y: 0, duration: 2 }
    );
  }, []);

  return <div ref={el} className="text-white text-2xl">Epic GSAP Reveal</div>;
}

export default GSAPText;

