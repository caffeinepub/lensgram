import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Username = Text;
  type UserProfile = {
    displayName : Text;
    email : Text;
    username : Username;
  };

  type Message = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type CallState = {
    caller : Principal;
    callee : Principal;
    isActive : Bool;
  };

  type ConnectionRequest = {
    requester : Principal;
    target : Principal;
    timestamp : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernames = Map.empty<Username, Principal>();
  let connections = Map.empty<Principal, List.List<Principal>>();
  let pendingRequests = Map.empty<Principal, List.List<ConnectionRequest>>();
  let conversations = Map.empty<Text, List.List<Message>>();
  let callStates = Map.empty<Principal, CallState>();

  func normalizeUsername(username : Text) : Text {
    username // No conversion yet available in core
  };

  func getConversationKey(user1 : Principal, user2 : Principal) : Text {
    let p1 = user1.toText();
    let p2 = user2.toText();
    if (p1 < p2) {
      p1 # ":" # p2;
    } else {
      p2 # ":" # p1;
    };
  };

  func areConnected(user1 : Principal, user2 : Principal) : Bool {
    switch (connections.get(user1)) {
      case (null) { false };
      case (?connList) {
        switch (connList.find(func(p) { p == user2 })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  func hasPendingRequest(from : Principal, to : Principal) : Bool {
    switch (pendingRequests.get(to)) {
      case (null) { false };
      case (?reqList) {
        switch (reqList.find(func(req) { req.requester == from })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  public shared ({ caller }) func onboard(displayName : Text, email : Text, username : Text) : async UserProfile {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already onboarded");
    };

    let normalizedUsername = normalizeUsername(username);

    if (usernames.containsKey(normalizedUsername)) {
      Runtime.trap("Username taken");
    };

    let userProfile : UserProfile = {
      displayName;
      email;
      username = normalizedUsername;
    };

    userProfiles.add(caller, userProfile);
    usernames.add(normalizedUsername, caller);

    userProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not onboarded") };
      case (?existingProfile) {
        let normalizedUsername = normalizeUsername(profile.username);
        if (normalizedUsername != existingProfile.username) {
          if (usernames.containsKey(normalizedUsername)) {
            Runtime.trap("Username taken");
          };
          usernames.remove(existingProfile.username);
          usernames.add(normalizedUsername, caller);
        };
        userProfiles.add(caller, profile);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not areConnected(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view connected users' profiles");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getUserByUsername(username : Username) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for other users");
    };

    let normalized = normalizeUsername(username);
    switch (usernames.get(normalized)) {
      case (null) { null };
      case (?principal) { userProfiles.get(principal) };
    };
  };

  public shared ({ caller }) func sendConnectionRequest(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send requests");
    };

    if (target == caller) {
      Runtime.trap("Cannot connect to yourself");
    };

    if (not userProfiles.containsKey(target)) {
      Runtime.trap("Target user does not exist");
    };

    if (areConnected(caller, target)) {
      Runtime.trap("Already connected");
    };

    if (hasPendingRequest(caller, target)) {
      Runtime.trap("Request already sent");
    };

    let request : ConnectionRequest = {
      requester = caller;
      target;
      timestamp = Time.now();
    };

    let targetRequests = switch (pendingRequests.get(target)) {
      case (null) { List.empty<ConnectionRequest>() };
      case (?reqs) { reqs };
    };

    targetRequests.add(request);
    pendingRequests.add(target, targetRequests);
  };

  public shared ({ caller }) func acceptConnectionRequest(requester : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept requests");
    };

    if (not hasPendingRequest(requester, caller)) {
      Runtime.trap("No pending request from this user");
    };

    let callerRequests = switch (pendingRequests.get(caller)) {
      case (null) { List.empty<ConnectionRequest>() };
      case (?reqs) { reqs };
    };

    let updatedRequests = callerRequests.filter(func(req : ConnectionRequest) : Bool {
      req.requester != requester;
    });
    pendingRequests.add(caller, updatedRequests);

    let callerConnections = switch (connections.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?conns) { conns };
    };
    callerConnections.add(requester);
    connections.add(caller, callerConnections);

    let requesterConnections = switch (connections.get(requester)) {
      case (null) { List.empty<Principal>() };
      case (?conns) { conns };
    };
    requesterConnections.add(caller);
    connections.add(requester, requesterConnections);
  };

  public shared ({ caller }) func rejectConnectionRequest(requester : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject requests");
    };

    if (not hasPendingRequest(requester, caller)) {
      Runtime.trap("No pending request from this user");
    };

    let callerRequests = switch (pendingRequests.get(caller)) {
      case (null) { List.empty<ConnectionRequest>() };
      case (?reqs) { reqs };
    };

    let updatedRequests = callerRequests.filter(func(req : ConnectionRequest) : Bool {
      req.requester != requester;
    });
    pendingRequests.add(caller, updatedRequests);
  };

  public query ({ caller }) func getPendingRequests() : async [ConnectionRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view requests");
    };

    switch (pendingRequests.get(caller)) {
      case (null) { [] };
      case (?reqs) { reqs.toArray() };
    };
  };

  public query ({ caller }) func getConnections() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view connections");
    };

    switch (connections.get(caller)) {
      case (null) { [] };
      case (?conns) { conns.toArray() };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (not areConnected(caller, recipient)) {
      Runtime.trap("Unauthorized: Can only message connected users");
    };

    let message : Message = {
      sender = caller;
      content;
      timestamp = Time.now();
    };

    let conversationKey = getConversationKey(caller, recipient);
    let conversation = switch (conversations.get(conversationKey)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };

    conversation.add(message);
    conversations.add(conversationKey, conversation);
  };

  public query ({ caller }) func getMessages(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    if (not areConnected(caller, otherUser)) {
      Runtime.trap("Unauthorized: Can only view messages with connected users");
    };

    let conversationKey = getConversationKey(caller, otherUser);
    switch (conversations.get(conversationKey)) {
      case (null) { [] };
      case (?msgs) { msgs.toArray() };
    };
  };

  public shared ({ caller }) func initiateCall(callee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initiate calls");
    };

    if (not areConnected(caller, callee)) {
      Runtime.trap("Unauthorized: Can only call connected users");
    };

    if (callStates.containsKey(caller)) {
      Runtime.trap("Already in a call");
    };

    if (callStates.containsKey(callee)) {
      Runtime.trap("User is already in a call");
    };

    let callState : CallState = {
      caller = caller;
      callee;
      isActive = true;
    };

    callStates.add(caller, callState);
    callStates.add(callee, callState);
  };

  public shared ({ caller }) func acceptCall(callInitiator : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept calls");
    };

    switch (callStates.get(caller)) {
      case (null) { Runtime.trap("No incoming call") };
      case (?state) {
        if (state.caller != callInitiator or state.callee != caller) {
          Runtime.trap("Invalid call state");
        };
      };
    };
  };

  public shared ({ caller }) func declineCall(callInitiator : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline calls");
    };

    switch (callStates.get(caller)) {
      case (null) { Runtime.trap("No incoming call") };
      case (?state) {
        if (state.caller != callInitiator or state.callee != caller) {
          Runtime.trap("Invalid call state");
        };
        callStates.remove(caller);
        callStates.remove(callInitiator);
      };
    };
  };

  public shared ({ caller }) func endCall(partner : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end calls");
    };

    switch (callStates.get(caller)) {
      case (null) { Runtime.trap("Not in a call") };
      case (?state) {
        if ((state.caller != caller and state.callee != caller) or
            (state.caller != partner and state.callee != partner)) {
          Runtime.trap("Invalid call state");
        };
        callStates.remove(caller);
        callStates.remove(partner);
      };
    };
  };

  public query ({ caller }) func getCallState() : async ?CallState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view call state");
    };
    callStates.get(caller);
  };
};
