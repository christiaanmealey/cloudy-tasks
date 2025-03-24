import { useState, useEffect } from 'react';
import { GetCommand, GetCommandOutput, PutCommand } from '@aws-sdk/lib-dynamodb';
import docClient from '../utils/awsConfig';

const TABLE_NAME = 'Settings';

const useUserSettings = (email: string|undefined) => {
    const [settings, setSettings] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async() => {
            if (!email) return;

            try {
                setLoading(true);
                const command = new GetCommand({
                    TableName: TABLE_NAME,
                    Key: {email}
                });
                const response = await docClient.send(command);
                setSettings(response.Item);
            } catch (error) {
                const err = `there was an error getting user settings: ${error}`;
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [email])

    return {settings, loading, error};
}

export default useUserSettings;