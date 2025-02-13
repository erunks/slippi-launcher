import { ipcRenderer } from "electron";
import { useToasts } from "react-toast-notifications";

export const useFileDrag = () => {
  const { addToast } = useToasts();

  const fileDrag = async (event: React.DragEvent<HTMLDivElement>, filePaths: string[]) => {
    try {
      event.preventDefault();
      if (filePaths.length > 0) {
        ipcRenderer.send("onDragStart", filePaths);
      }
    } catch (err) {
      addToast(err.message ?? JSON.stringify(err), {
        appearance: "error",
      });
    }
  };

  return (event: React.DragEvent<HTMLDivElement>, filePaths: string[]) => {
    void fileDrag(event, filePaths);
  };
};
