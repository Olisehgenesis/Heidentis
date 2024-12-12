// pages/admin/TopicsSetup.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTopics } from '@/hooks/useTopics';
import { Loader2 } from 'lucide-react';

const TopicsSetup = () => {
  const { topicIds, loading, error, initializeTopics } = useTopics();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">HCS Topics Setup</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Institution Registry Topic</CardTitle>
          </CardHeader>
          <CardContent>
            {topicIds?.institutions ? (
              <div>
                <p className="font-mono bg-gray-100 p-2 rounded">
                  {topicIds.institutions.toString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Topic created and ready for messages
                </p>
              </div>
            ) : (
              <p className="text-red-500">Topic not initialized</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credential Management Topic</CardTitle>
          </CardHeader>
          <CardContent>
            {topicIds?.credentials ? (
              <div>
                <p className="font-mono bg-gray-100 p-2 rounded">
                  {topicIds.credentials.toString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Topic created and ready for messages
                </p>
              </div>
            ) : (
              <p className="text-red-500">Topic not initialized</p>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Button 
          onClick={initializeTopics}
          disabled={loading || (!!topicIds?.institutions && !!topicIds?.credentials)}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            'Initialize Topics'
          )}
        </Button>
      </div>
    </div>
  );
};

export default TopicsSetup;