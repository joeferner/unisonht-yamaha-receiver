import {YamahaReceiverClient} from "./YamahaReceiverClient";
import * as xpath from "xpath";
import * as xmldom from "xmldom";
import Debug from 'debug';
import {YamahaReceiverInput, YamahaReceiverZone} from "./YamahaReceiver";
import {ButtonNotFoundError, StandardKey} from "unisonht";
import axios from "axios";

const debug = Debug('YamahaReceiver:ClientImpl');

export class YamahaReceiverClientImpl implements YamahaReceiverClient {
    private address: string;

    constructor(address: string) {
        this.address = address;
    }

    async changeInput(input: YamahaReceiverInput): Promise<void> {
        await this.changeInputOfZone(YamahaReceiverZone.MAIN, input);
    }

    async on(): Promise<void> {
        await this.putXml(YamahaReceiverZone.MAIN, "<Power_Control><Power>On</Power></Power_Control>");
    }

    async off(): Promise<void> {
        await this.putXml(YamahaReceiverZone.MAIN, "<Power_Control><Power>Standby</Power></Power_Control>");
    }

    async buttonPress(buttonName: string): Promise<void> {
        switch (buttonName) {
            case StandardKey.MUTE:
                await this.toggleMute(YamahaReceiverZone.MAIN);
                return;
            case StandardKey.VOLUME_UP:
                await this.changeVolume(YamahaReceiverZone.MAIN, 0.5);
                return;
            case StandardKey.VOLUME_DOWN:
                await this.changeVolume(YamahaReceiverZone.MAIN, -0.5);
                return;
            default:
                throw new ButtonNotFoundError(buttonName);
        }
    }

    private async changeInputOfZone(zone: YamahaReceiverZone, input: YamahaReceiverInput): Promise<Document> {
        const command = `<YAMAHA_AV cmd="PUT"><${zone}><Input><Input_Sel>${input}</Input_Sel></Input></${zone}></YAMAHA_AV>`;
        return await this.sendXMLToReceiver(command);
    }

    private async toggleMute(zone: YamahaReceiverZone): Promise<void> {
        const muted = await this.isMuted(zone);
        if (muted) {
            await this.muteOff(zone);
        } else {
            await this.muteOn(zone);
        }
    }

    private async isMuted(zone: YamahaReceiverZone): Promise<boolean> {
        return await this.isStatusParamOn(zone, 'Mute');
    }

    private async muteOff(zone: YamahaReceiverZone): Promise<void> {
        await this.putXml(zone, '<Volume><Mute>Off</Mute></Volume>');
    }

    private async muteOn(zone: YamahaReceiverZone): Promise<void> {
        await this.putXml(zone, '<Volume><Mute>On</Mute></Volume>');
    }

    private async changeVolume(zone: YamahaReceiverZone, delta: number): Promise<void> {
        const direction = delta > 0 ? "Up" : "Down";
        const amount = Math.abs(delta) == 0.5 ? '' : ` ${Math.abs(delta)} dB `;
        const xml = `<Volume><Lvl><Val>${direction}${amount}</Val><Exp></Exp><Unit></Unit></Lvl></Volume>`;
        await this.putXml(zone, xml);
    }

    private async isStatusParamOn(zone: YamahaReceiverZone, param: string): Promise<boolean> {
        const statusString = await this.getStatusString(zone, param)
        return statusString.toUpperCase() == 'ON';
    }

    private async putXml(zone: YamahaReceiverZone, content: string): Promise<Document> {
        const command = `<YAMAHA_AV cmd="PUT"><${zone}>${content}</${zone}></YAMAHA_AV>`;
        return await this.sendXMLToReceiver(command);
    }

    private async getXml(zone: YamahaReceiverZone, content: string): Promise<Document> {
        const command = `<YAMAHA_AV cmd="GET"><${zone}>${content}</${zone}></YAMAHA_AV>`;
        return await this.sendXMLToReceiver(command);
    }

    private async getBasicStatus(zone: YamahaReceiverZone): Promise<Document> {
        return await this.getXml(zone, '<Basic_Status>GetParam</Basic_Status>');
    }

    private async getStatusString(zone: YamahaReceiverZone, param: string): Promise<string> {
        const statusXml = await this.getBasicStatus(zone);
        return xpath.select(`//${param}/text()`, statusXml).toString();
    }

    private async sendXMLToReceiver(command: string): Promise<Document> {
        const url = `http://${this.address}/YamahaRemoteControl/ctrl`;
        debug(`sending command ${url} => ${command}`);
        const resp = await axios.post(url, command, {
            method: 'POST',
            headers: {
                'Connection': 'close',
                'Content-Type': 'text/xml; charset=utf-8',
                'Content-Length': Buffer.byteLength(command)
            }
        });
        const responseData = resp.data;
        debug(`responseData ${responseData}`);
        return new xmldom.DOMParser().parseFromString(responseData);
    }
}
