import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Prisma } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppGateway.name);
  /**
   * Handles the disconnection of a client.
   *
   * @param {Socket} client - The disconnected client.
   * @return {void} This function does not return anything.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`client disconnected: ${client.id}`);
  }
  /**
   * Handles the connection of a client.
   *
   * @param {Socket} client - The client socket object.
   */
  handleConnection(client: Socket) {
    this.logger.log(`client connected: ${client.id}`);
  }

  /**
   * A description of the entire function.
   *
   * @param {Server} server - the server object
   * @return {void} no return value
   */
  afterInit(server: Server) {
    this.logger.log(server);
  }

  @WebSocketServer() server: Server;
  @SubscribeMessage('sendMessage')
  /**
   * Handles sending a message.
   *
   * @param {Socket} client - The client socket.
   * @param {Prisma.ChatCreateInput} payload - The payload for creating a chat.
   * @return {Promise<void>} A promise that resolves with void.
   */
  async handleSendMessage(
    client: Socket,
    payload: Prisma.ChatCreateInput,
  ): Promise<void> {
    this.logger.log(payload);
    const createdMessage = await this.appService.createMessage(payload);
    this.server.emit('recMessage', createdMessage);
  }
}
