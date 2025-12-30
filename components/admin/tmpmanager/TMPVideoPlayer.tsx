import React from 'react';
import YouTube from 'react-youtube';
interface TMPVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  onClose?: () => void;
  onEnd?: () => void;
}
const TMPVideoPlayer: React.FC<TMPVideoPlayerProps> = ({ 
  videoId, 
  title, 
  className,
  onClose,
  onEnd 
}) => {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };
  const handleEnd = () => {
    onEnd?.();
  };
  return (
    <div className={className}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
        >
          ✕
        </button>
      )}
      <YouTube 
        videoId={videoId} 
        opts={opts} 
        title={title}
        onEnd={handleEnd}
      />
    </div>
  );
};
export default TMPVideoPlayer;