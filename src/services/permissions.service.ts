// Request permission to access audio devices
export async function requestAudioPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted
      console.log("Permission to access audio devices granted.");
    } catch (error) {
      // Permission denied or error
      console.error("Error accessing audio devices:", error);
    }
  }
  
  // Function to enumerate available audio output devices
export async function enumerateOutputDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputDevices = devices.filter(
      (device) => device.kind === "audiooutput"
    );
    return outputDevices;
  }
  
 export async function verifyPermission(fileHandle: FileSystemFileHandle, withWrite: boolean) {
    const opts = { mode: 'read'};
    if (withWrite) {
      opts.mode = "readwrite";
    }
  
    // Check if we already have permission, if so, return true.
    //@ts-ignore
    if ((await fileHandle.queryPermission(opts)) === "granted") {
      return true;
    }
  
    // The user did not grant permission, return false.
    return false;
  }