package com.eAuction.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${activemq.relay.host:localhost}")
    private String relayHost;

    @Value("${activemq.client.login:admin}")
    private String clientLogin;

    @Value("${activemq.client.passcode:admin}")
    private String clientPasscode;

    @Value("${activemq.system.login:admin}")
    private String systemLogin;

    @Value("${activemq.system.passcode:admin}")
    private String systemPasscode;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Hooks STOMP broker relay to ActiveMQ using externalized properties
        config.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(relayHost)
                .setRelayPort(61613)
                .setClientLogin(clientLogin)
                .setClientPasscode(clientPasscode)
                .setSystemLogin(systemLogin)
                .setSystemPasscode(systemPasscode);

        // Designates the prefix for messages bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the WebSocket endpoint that your frontend will connect to
        registry.addEndpoint("/ws-auction")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}