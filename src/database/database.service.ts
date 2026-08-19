import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
    private isConnected: boolean = true;

    onModuleInit() {
        console.log("DatabaseService initialized: Connected");
    }

    onApplicationShutdown(signal?: string) {
        this.isConnected = false;
        console.log(`DatabaseService shutdown. Signal: ${signal}`);
    }

    getStatus() {
        return this.isConnected ? "Connected" : "Disconnected";
    }
}


