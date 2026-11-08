import React, { VideoHTMLAttributes, useEffect, useRef } from 'react'

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream
}

export default function Video({ srcObject, ...props }: PropsType) {
  const refVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!refVideo.current || !srcObject) return
    refVideo.current.srcObject = srcObject
    const playPromise = refVideo.current.play()
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Video] Play was prevented or interrupted:', err)
      })
    }
  }, [srcObject])

  return <video ref={refVideo} playsInline autoPlay {...props} />
}
