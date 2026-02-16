import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ConnectionRequest {
    requester: Principal;
    target: Principal;
    timestamp: Time;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
}
export type Username = string;
export interface CallState {
    isActive: boolean;
    callee: Principal;
    caller: Principal;
}
export interface UserProfile {
    username: Username;
    displayName: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptCall(callInitiator: Principal): Promise<void>;
    acceptConnectionRequest(requester: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    declineCall(callInitiator: Principal): Promise<void>;
    endCall(partner: Principal): Promise<void>;
    getCallState(): Promise<CallState | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConnections(): Promise<Array<Principal>>;
    getMessages(otherUser: Principal): Promise<Array<Message>>;
    getPendingRequests(): Promise<Array<ConnectionRequest>>;
    getUserByUsername(username: Username): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initiateCall(callee: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    onboard(displayName: string, email: string, username: string): Promise<UserProfile>;
    rejectConnectionRequest(requester: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendConnectionRequest(target: Principal): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
}
