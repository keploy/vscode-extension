import * as vscode from 'vscode';
import * as Sentry from '@sentry/node';

function SentryInit(): Sentry.NodeClient | undefined {
    return Sentry.init({
        dsn: '<your-sentry-dsn-here>',
        release: '<your-extension-version>',
        beforeSend(event) {
            // Respect user telemetry settings
            const telemetryEnabled = vscode.workspace.getConfiguration('telemetry').get<boolean>('enableTelemetry');
            if (!telemetryEnabled) {
                // Do not send the event if telemetry is disabled
                return null;
            }
            return event;
        }
    });
}

// Create a singleton instance of Sentry and export it
const SentryInstance = SentryInit();

export { SentryInstance };