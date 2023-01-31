export interface TerminalProps {
    initialExecution?: {
        shell?: string;
        args?: string[];
        cwd?: string;
    };
    onExecutionEnd?: (exitCode: number, signal?: number) => void;
    onData?: (data: string) => void;
    environmentVariables?: EnvironmentVariables;
    readOnly?: boolean;
}

export interface TerminalViewProps {
    uid: string;
}

export type ExposedTerminal = React.FC<TerminalProps>;
export type Terminal = React.FC<TerminalProps>;

export type EnvironmentVariables = Record<string, string>;
