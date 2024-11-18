// telemetry.ts
import * as https from 'https';
import * as os from 'os';

class Telemetry {
    private static instance: Telemetry;

    private enabled: boolean;
    private installationId: string;
    private extensionVersion: string;
    private telemetryUrl: string = 'https://telemetry.keploy.io/analytics';

    private constructor(options: {
        enabled: boolean;
        installationId: string;
        extensionVersion: string;
    }) {
        this.enabled = options.enabled;
        this.installationId = options.installationId;
        this.extensionVersion = options.extensionVersion;
    }

    public static initialize(options: {
        enabled: boolean;
        installationId: string;
        extensionVersion: string;
    }): void {
        if (!Telemetry.instance) {
            Telemetry.instance = new Telemetry(options);
            console.log('Telemetry initialized with options:', options);
        }
    }

    public static getInstance(): Telemetry {
        if (!Telemetry.instance) {
            throw new Error("Telemetry not initialized. Call Telemetry.initialize() first.");
        }
        return Telemetry.instance;
    }

    private sendTelemetry(eventType: string, data: Record<string, any> = {}) {
        if (!this.enabled) return;
        console.log(`Telemetry: Sending event '${eventType}' with data:`, data);

        const event = {
            EventType: eventType,
            CreatedAt: Date.now(),
            InstallationID: this.installationId,
            OS: os.platform(),
            KeployVersion: this.extensionVersion,
            Arch: os.arch(),
            Meta: data,
        };

        const postData = JSON.stringify(event);

        const options = {
            hostname: 'telemetry.keploy.io',
            port: 443,
            path: '/analytics',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                // Handle response if necessary
            });
        });

        req.on('error', (error) => {
            console.error(`Telemetry error: ${error.message}`);
        });

        req.write(postData);
        req.end();
    }

    public trackEvent(eventName: string, properties?: Record<string, any>) {
        console.log(`Telemetry: Tracking event '${eventName}' with properties:`, properties);
        this.sendTelemetry(eventName, properties);
    }
}

export { Telemetry };
