import {YamahaReceiverInput} from "./YamahaReceiver";

export interface YamahaReceiverClient {
    changeInput(input: YamahaReceiverInput): Promise<void>;

    on(): Promise<void>;

    off(): Promise<void>;

    buttonPress(buttonName: string): Promise<void>;
}
