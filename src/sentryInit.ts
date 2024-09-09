import * as vscode from 'vscode';
import * as Sentry from '@sentry/node';

function SentryInit(): Sentry.NodeClient | undefined {
    return Sentry.init({
        dsn: process.env.SENTRY_DSN,
        beforeSend(event) {
            const telemetryEnabled = vscode.workspace.getConfiguration('telemetry').get<boolean>('enableTelemetry');
            if (!telemetryEnabled) {
                // Do not send the event if telemetry is disabled
                return null;
            }
            return event;
        }
    });
}

const SentryInstance = SentryInit();

export { SentryInstance };