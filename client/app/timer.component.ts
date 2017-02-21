export declare class TimerWrapper {  
    static setTimeout(fn: (...args: any[]) => void, millis: number): number;
    static clearTimeout(id: number): void;
    static setInterval(fn: (...args: any[]) => void, millis: number): number;
    static clearInterval(id: number): void;
}