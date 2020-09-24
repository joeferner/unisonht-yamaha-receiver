import {
    NextFunction,
    RouteHandlerRequest,
    RouteHandlerResponse,
    StandardButton,
    SupportedButtons,
    UnisonHT,
    UnisonHTDevice,
} from '@unisonht/unisonht';
import { YamahaReceiverClient } from './YamahaReceiverClient';
import { YamahaReceiverClientMock } from './YamahaReceiverClientMock';
import { YamahaReceiverClientImpl } from './YamahaReceiverClientImpl';
import { YamahaReceiverButton } from './YamahaReceiverButton';
import { YamahaReceiverInput, YamahaReceiverStatus, YamahaReceiverZone } from './YamahaReceiverStatus';

export interface YamahaReceiverOptions {
    useMockClient?: boolean;
    address: string;
}

export class YamahaReceiver implements UnisonHTDevice {
    private readonly deviceName: string;
    private readonly client: YamahaReceiverClient;

    constructor(deviceName: string, options: YamahaReceiverOptions) {
        this.deviceName = deviceName;
        this.client = options.useMockClient
            ? new YamahaReceiverClientMock()
            : new YamahaReceiverClientImpl(options.address);
    }

    public getDeviceName(): string {
        return this.deviceName;
    }

    public getSupportedButtons(): SupportedButtons {
        return {
            [StandardButton.POWER_ON]: {
                name: 'Power On',
                handleButtonPress: async (button, request, response, next) => {
                    await this.client.on();
                    response.send();
                },
            },
            [StandardButton.POWER_OFF]: {
                name: 'Power Off',
                handleButtonPress: async (button, request, response, next) => {
                    await this.client.off();
                    response.send();
                },
            },
            [StandardButton.POWER_TOGGLE]: {
                name: 'Power On',
                handleButtonPress: async (button, request, response, next) => {
                    await this.client.powerToggle();
                    response.send();
                },
            },
            [StandardButton.MUTE]: {
                name: 'Mute',
                handleButtonPress: this.createButtonPressHandler(YamahaReceiverButton.MUTE),
            },
            [StandardButton.VOLUME_UP]: {
                name: 'Volume Up',
                handleButtonPress: this.createButtonPressHandler(YamahaReceiverButton.VOLUME_UP),
            },
            [StandardButton.VOLUME_DOWN]: {
                name: 'Volume Down',
                handleButtonPress: this.createButtonPressHandler(YamahaReceiverButton.VOLUME_DOWN),
            },
            [StandardButton.INPUT_HDMI1]: {
                name: 'Input: HDMI1',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.HDMI1),
            },
            [StandardButton.INPUT_HDMI2]: {
                name: 'Input: HDMI2',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.HDMI2),
            },
            [StandardButton.INPUT_HDMI3]: {
                name: 'Input: HDMI3',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.HDMI3),
            },
            [StandardButton.INPUT_HDMI4]: {
                name: 'Input: HDMI4',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.HDMI4),
            },
            [StandardButton.INPUT_HDMI5]: {
                name: 'Input: HDMI5',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.HDMI5),
            },
            [StandardButton.INPUT_AV1]: {
                name: 'Input: AV1',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.AV1),
            },
            [StandardButton.INPUT_AV2]: {
                name: 'Input: AV2',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.AV2),
            },
            [StandardButton.INPUT_AV3]: {
                name: 'Input: AV3',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.AV3),
            },
            [StandardButton.INPUT_AV4]: {
                name: 'Input: AV4',
                handleButtonPress: this.createInputButtonPressHandler(YamahaReceiverInput.AV4),
            },
        };
    }

    private createInputButtonPressHandler(input: YamahaReceiverInput) {
        return async (
            btn: string,
            request: RouteHandlerRequest,
            response: RouteHandlerResponse,
            next: NextFunction,
        ): Promise<void> => {
            await this.client.changeInput(input);
            response.send();
        };
    }

    private createButtonPressHandler(button: YamahaReceiverButton) {
        return async (
            btn: string,
            request: RouteHandlerRequest,
            response: RouteHandlerResponse,
            next: NextFunction,
        ): Promise<void> => {
            await this.client.buttonPress(button);
            response.send();
        };
    }

    public async getStatus(): Promise<YamahaReceiverStatus> {
        return await this.client.getStatus(YamahaReceiverZone.MAIN);
    }

    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.post(this, 'on', {
            handler: this.handleOn.bind(this),
        });
        unisonht.post(this, 'off', {
            handler: this.handleOff.bind(this),
        });
        unisonht.post(this, 'input/:input', {
            handler: this.handleChangeInput.bind(this),
        });
    }

    private async handleChangeInput(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        const input = request.parameters.input;
        await this.client.changeInput(input);
    }

    private async handleOn(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        await this.client.on();
    }

    private async handleOff(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        await this.client.off();
    }
}
