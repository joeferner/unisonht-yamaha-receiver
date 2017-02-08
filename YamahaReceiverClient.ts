export interface YamahaReceiverClient {
  changeInput(input: string): Promise<void>;
  on(): Promise<void>;
  off(): Promise<void>;
  buttonPress(buttonName: string): Promise<void>;
}