import { Constants, FileType } from 'athena';

export type MessageReplyContent =
    | (Constants.RESTPostAPIWebhookWithTokenJSONBody & {
          embed?: Constants.APIEmbed | undefined;
          file?: FileType | undefined;
      })
    | Constants.APIInteractionResponseCallbackData
    | (Constants.RESTPostAPIChannelMessageJSONBody & {
          embed?: Constants.APIEmbed | undefined;
      });
