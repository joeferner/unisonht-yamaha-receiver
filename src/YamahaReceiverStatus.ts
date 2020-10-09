import { DeviceStatusWithPower, DeviceStatusWithVolume, DeviceStatusWithInput } from '@unisonht/unisonht';

export enum YamahaReceiverZone {
    MAIN = 'Main_Zone',
}

export enum YamahaReceiverInput {
    HDMI1 = 'HDMI1',
    HDMI2 = 'HDMI2',
    HDMI3 = 'HDMI3',
    HDMI4 = 'HDMI4',
    HDMI5 = 'HDMI5',
    AV1 = 'AV1',
    AV2 = 'AV2',
    AV3 = 'AV3',
    AV4 = 'AV4',
}

export interface YamahaReceiverStatus extends DeviceStatusWithPower, DeviceStatusWithVolume, DeviceStatusWithInput {
    input: YamahaReceiverInput;
}
