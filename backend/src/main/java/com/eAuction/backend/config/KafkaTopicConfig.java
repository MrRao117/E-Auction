package com.eAuction.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String BID_EVENTS_TOPIC = "auction-bid-events";

    @Bean
    public NewTopic bidEventsTopic() {
        return TopicBuilder.name(BID_EVENTS_TOPIC)
                .partitions(3) // Allows up to 3 parallel consumer instances
                .replicas(1)
                .build();
    }
}