/**
 * SerialController.js
 * Utility to handle direct browser communication with Arduino via Web Serial API.
 */

export class SerialController {
    constructor() {
        this.port = null;
        this.writer = null;
        this.reader = null;
        this.isConnected = false;
        this.onStatusChange = null;
        this.onDataReceived = null;
    }

    async connect() {
        try {
            // Filter for typical Arduino/USB-Serial devices if possible, 
            // or just let user pick from all available ports.
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 });
            
            this.writer = this.port.writable.getWriter();
            this.isConnected = true;
            
            if (this.onStatusChange) this.onStatusChange(true);
            
            // Start reading loop in background
            this.readLoop();
            
            console.log("Connected to Serial Port");
            return true;
        } catch (error) {
            console.error("Serial Connection Failed:", error);
            this.isConnected = false;
            if (this.onStatusChange) this.onStatusChange(false);
            return false;
        }
    }

    async disconnect() {
        if (this.reader) {
            await this.reader.cancel();
        }
        if (this.writer) {
            this.writer.releaseLock();
        }
        if (this.port) {
            await this.port.close();
        }
        this.isConnected = false;
        if (this.onStatusChange) this.onStatusChange(false);
    }

    async send(data) {
        if (!this.isConnected || !this.writer) return;
        
        try {
            const encoder = new TextEncoder();
            const formattedData = data.endsWith('\n') ? data : data + '\n';
            await this.writer.write(encoder.encode(formattedData));
        } catch (error) {
            console.error("Failed to send data:", error);
        }
    }

    async readLoop() {
        while (this.port && this.port.readable && this.isConnected) {
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
            this.reader = textDecoder.readable.getReader();

            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) break;
                    if (value && this.onDataReceived) {
                        this.onDataReceived(value);
                    }
                }
            } catch (error) {
                console.error("Read Error:", error);
            } finally {
                this.reader.releaseLock();
            }
        }
    }
}

// Singleton instance
export const serialManager = new SerialController();
