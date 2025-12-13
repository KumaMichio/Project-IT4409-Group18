'use client';

import { useEffect, useRef, useState } from 'react';
import { Lesson } from './types';
import { API_URL } from '../../config/api';

type VideoPlayerProps = {
  lesson: Lesson | null;
  onProgress: (watchedSeconds: number) => void;
  onComplete: (watchedSeconds: number) => void;
  resumeSeconds?: number;
};

const isYouTubeUrl = (url: string | undefined) =>
  !!url && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

const getYouTubeVideoId = (url: string | undefined) => {
  if (!url) return null;
  return url.match(/[?&]v=([^&#]+)/)?.[1] || url.match(/youtu\.be\/([^?&#]+)/)?.[1] || null;
};

export function VideoPlayer({ lesson, onProgress, onComplete, resumeSeconds = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const initialResumeRef = useRef(resumeSeconds);
  const hasSeekedRef = useRef(false);

  const videoAsset = lesson?.assets.find(a => a.asset_kind === 'VIDEO') || null;
  const isYouTube = videoAsset && isYouTubeUrl(videoAsset.url);

  // Reset initial resume when lesson changes
  useEffect(() => {
    initialResumeRef.current = resumeSeconds;
    hasSeekedRef.current = false;
  }, [lesson?.id, videoAsset?.url]);

  const clearYouTubeInterval = () => {
    if (youtubeIntervalRef.current) {
      clearInterval(youtubeIntervalRef.current as unknown as number);
      youtubeIntervalRef.current = null;
    }
  };

  // Load YouTube Iframe API once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT && (window as any).YT.Player) {
      setIsYouTubeApiReady(true);
      return;
    }

    const scriptId = 'youtube-iframe-api';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = scriptId;
      document.body.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiReady(true);
    };
  }, []);

  // HTML5 video tracking
  useEffect(() => {
    if (!videoAsset || isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    const seekToResume = () => {
      if (hasSeekedRef.current) return;
      const duration = video.duration;
      const resumeAt = initialResumeRef.current;
      if (!duration || resumeAt <= 1) return;
      const clamped = Math.min(resumeAt, Math.max(duration - 1, 0));
      if (clamped > 1) {
        video.currentTime = clamped;
        hasSeekedRef.current = true;
      }
    };

    if (video.readyState >= 1) {
      seekToResume();
    } else {
      video.addEventListener('loadedmetadata', seekToResume, { once: true });
    }

    const handleTimeUpdate = () => {
      const watchedSeconds = Math.floor(video.currentTime);
      if (watchedSeconds % 5 === 0) {
        onProgress(watchedSeconds);
      }
    };

    const handleEnded = () => {
      const duration = lesson?.duration_s || Math.floor(video.duration || 0) || 0;
      if (duration) {
        onComplete(duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', seekToResume);
    };
  }, [videoAsset, isYouTube, lesson?.duration_s, onProgress, onComplete]);

  // YouTube tracking
  useEffect(() => {
    if (!videoAsset || !isYouTube || !isYouTubeApiReady) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
      clearYouTubeInterval();
      return;
    }

    const videoId = getYouTubeVideoId(videoAsset.url);
    if (!videoId) return;

    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    const startPolling = () => {
      clearYouTubeInterval();
      youtubeIntervalRef.current = setInterval(() => {
        const player = youtubePlayerRef.current;
        if (!player) return;
        const duration = player.getDuration();
        const currentTime = Math.floor(player.getCurrentTime());
        if (!duration) return;

        onProgress(currentTime);

        if (currentTime >= duration * 0.9) {
          onComplete(duration);
          clearYouTubeInterval();
        }
      }, 5000);
    };

    youtubePlayerRef.current = new (window as any).YT.Player('youtube-player', {
      videoId,
      playerVars: {
        origin: window.location.origin,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        autoplay: 1,
        loop: 0,
        playsinline: 1
      },
      events: {
        onReady: (event: any) => {
          if (!hasSeekedRef.current) {
            const duration = event.target.getDuration?.() || 0;
            const resumeAt = initialResumeRef.current;
            if (duration && resumeAt > 1) {
              const clamped = Math.min(resumeAt, Math.max(duration - 1, 0));
              if (clamped > 1) {
                event.target.seekTo(clamped, true);
                hasSeekedRef.current = true;
              }
            }
          }
          startPolling();
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          const YTState = (window as any).YT?.PlayerState;
          if (YTState && event.data === YTState.ENDED) {
            const duration = Math.floor(event.target.getDuration?.() || 0);
            const fallback = lesson?.duration_s || duration || 0;
            if (fallback) {
              onComplete(fallback);
            }
            clearYouTubeInterval();
            event.target.stopVideo();
          }
        }
      }
    });

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
      clearYouTubeInterval();
    };
  }, [videoAsset?.url, isYouTube, isYouTubeApiReady, lesson?.duration_s, onProgress, onComplete]);

  if (!videoAsset) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Không có video cho bài học này</p>
          {lesson?.assets.map(asset => (
            <div key={asset.id} className="mb-2">
              {asset.asset_kind === 'PDF' && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  📄 Xem tài liệu PDF
                </a>
              )}
              {asset.asset_kind === 'LINK' && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  🔗 Link tài liệu
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black flex items-center justify-center">
      {isYouTube ? (
        <div id="youtube-player" className="w-full h-full" />
      ) : (
        <video
          ref={videoRef}
          src={videoAsset.url.startsWith('/uploads/') ? `${API_URL}${videoAsset.url}` : videoAsset.url}
          controls
          className="w-full h-full"
          autoPlay
        />
      )}
    </div>
  );
}
