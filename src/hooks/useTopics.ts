// hooks/useTopics.ts
import { useState, useEffect } from 'react';
import { Client, TopicCreateTransaction, TopicId } from '@hashgraph/sdk';

export const useTopics = () => {
  const [topicIds, setTopicIds] = useState({
    institutions: null,
    credentials: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeTopics = async () => {
    try {
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      // Check localStorage first
      const storedInstitutionTopic = localStorage.getItem('institutionTopicId');
      const storedCredentialTopic = localStorage.getItem('credentialTopicId');

      if (storedInstitutionTopic && storedCredentialTopic) {
        setTopicIds({
          institutions: TopicId.fromString(storedInstitutionTopic),
          credentials: TopicId.fromString(storedCredentialTopic)
        });
        return;
      }

      // Create topics if they don't exist
      const institutionTopic = await new TopicCreateTransaction()
        .setSubmitKey(client.operatorPublicKey)
        .setTopicMemo("Institution Registry")
        .execute(client);

      const credentialTopic = await new TopicCreateTransaction()
        .setSubmitKey(client.operatorPublicKey)
        .setTopicMemo("Credential Management")
        .execute(client);

      const institutionReceipt = await institutionTopic.getReceipt(client);
      const credentialReceipt = await credentialTopic.getReceipt(client);

      const newTopicIds = {
        institutions: institutionReceipt.topicId,
        credentials: credentialReceipt.topicId
      };

      localStorage.setItem('institutionTopicId', newTopicIds.institutions.toString());
      localStorage.setItem('credentialTopicId', newTopicIds.credentials.toString());

      setTopicIds(newTopicIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeTopics();
  }, []);

  return { topicIds, loading, error, initializeTopics };
};