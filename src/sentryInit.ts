import * as vscode from 'vscode';
import * as SentryOptions from '@sentry/node';

function SentryInit(): SentryOptions.NodeClient | undefined {
    return SentryOptions.init({
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

const Sentry = SentryInit();

export { Sentry };