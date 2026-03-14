import { useState, useRef, useCallback } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropped: (blob: Blob) => void;
  aspectRatio?: number;
  title?: string;
}

const ImageCropDialog = ({
  open,
  imageSrc,
  onClose,
  onCropped,
  aspectRatio = 1,
  title = "Crop Image",
}: ImageCropDialogProps) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [cropping, setCropping] = useState(false);

  const handleCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    setCropping(true);
    cropper.getCroppedCanvas({ width: 400, height: 400 }).toBlob(
      (blob) => {
        if (blob) onCropped(blob);
        setCropping(false);
      },
      "image/jpeg",
      0.9
    );
  }, [onCropped]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-md">
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            style={{ height: 350, width: "100%" }}
            aspectRatio={aspectRatio}
            guides
            viewMode={1}
            autoCropArea={0.8}
            responsive
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCrop} disabled={cropping}>
            {cropping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crop & Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
