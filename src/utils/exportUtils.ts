import Konva from 'konva';
import { TacticsExportData, TacticalKeyframe, TeamConfig, PitchType, PitchView, PitchSurface } from '../types/tactics';

export function exportSnapshotToPng(stage: Konva.Stage, frameName = 'Frame') {
  try {
    const dataUrl = stage.toDataURL({
      pixelRatio: 2, // High DPI clarity
      mimeType: 'image/png',
    });

    const link = document.createElement('a');
    link.download = `bola_bundar_${frameName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export PNG snapshot:', err);
  }
}

export function exportTacticsToJson(data: {
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  gridColor?: string;
  showZones: boolean;
  zoneColor?: string;
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  frames: TacticalKeyframe[];
}) {
  try {
    const exportData: TacticsExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Bola Bundar Tactical Board',
      ...data,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `bola_bundar_tactics_${Date.now()}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export tactics JSON:', err);
  }
}

export function parseTacticsJson(file: File): Promise<TacticsExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as TacticsExportData;
        if (!parsed.frames || !Array.isArray(parsed.frames) || parsed.frames.length === 0) {
          throw new Error('Invalid tactics file format: missing frames array.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export class CanvasVideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private animationFrameId: number | null = null;
  private recordingCanvas: HTMLCanvasElement | null = null;
  private recordingCtx: CanvasRenderingContext2D | null = null;

  startRecording(stage: Konva.Stage, fps = 30): boolean {
    try {
      this.recordedChunks = [];
      const width = stage.width();
      const height = stage.height();

      // Create a dedicated high-res canvas for composite capture
      this.recordingCanvas = document.createElement('canvas');
      this.recordingCanvas.width = width;
      this.recordingCanvas.height = height;
      this.recordingCtx = this.recordingCanvas.getContext('2d');

      if (!this.recordingCtx) return false;

      // Capture stream from dedicated canvas
      const stream = this.recordingCanvas.captureStream(fps);

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000, // 4 Mbps crisp quality
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms chunk interval

      // Render loop synchronizing Konva stage output to the stream canvas
      const renderTick = () => {
        if (!this.recordingCtx || !this.recordingCanvas) return;
        try {
          const compCanvas = stage.toCanvas();
          this.recordingCtx.clearRect(0, 0, width, height);
          this.recordingCtx.drawImage(compCanvas, 0, 0, width, height);
        } catch {
          // ignore transient render frame drops
        }
        this.animationFrameId = requestAnimationFrame(renderTick);
      };

      renderTick();
      return true;
    } catch (err) {
      console.error('Failed to start Canvas Video Recorder:', err);
      return false;
    }
  }

  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedChunks = [];
        this.recordingCanvas = null;
        this.recordingCtx = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  downloadVideo(blob: Blob, filename = `bola_bundar_animation_${Date.now()}.webm`) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
