import EventBase from '../../types/EventBase';
import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, Constants, Events, ModalSubmitInteraction } from 'athena';
import NotiFyre from '../../Bot';

type InteractionType = 'command' | 'autocomplete' | 'modal' | 'component';
type Interactions = CommandInteraction | AutocompleteInteraction | ModalSubmitInteraction | ComponentInteraction;

export default class commandExecuted extends EventBase {
    name: keyof Events = 'commandExecuted';
    enabled = true;

    async handle(caller: NotiFyre, command: string, type: InteractionType, interaction: Interactions) {
        if (!this.enabled) return;

        const guild_name = interaction.guild?.name ?? 'DM';
        const guild_id = interaction.guild?.id ?? 'DM';
        const user = interaction.member ? interaction.member.user : interaction.user;
        if (!user) return;

        const baseLog = `${guild_name} (${guild_id}) ${user.global_name} (${user.id}):`;

        switch (type) {
            case 'autocomplete':
            case 'command': {
                if (interaction.isCommand() || interaction.isAutocomplete()) {
                    const command_name = interaction.command;
                    const command_group = interaction.group;
                    const subcommand = interaction.subcommand;
                    const options = interaction.options;

                    let message = `${baseLog} (${interaction.isCommand() ? 'Command' : 'Autocomplete'}) /${command_name} `;
                    if (command_group) message += `${command_group} `;
                    if (subcommand) message += `${subcommand} `;
                    if (options.length) message += this.parseParams(options);

                    //* Command Logs
                    //? Comment out entire line below to mute Command Logs
                    if (interaction.isCommand()) caller.logger.info(message);
                    //* Autocomplete Logs
                    //? Comment out entire line below to mute Autocomplete Logs
                    //else caller.logger.info(message);
                }
                break;
            }
            case 'modal':
                if (interaction.isModal()) {
                    const modalSubmit = interaction.data.components.map((row) => {
                        return `${row.components[0].custom_id}:${row.components[0].value}`;
                    });

                    //* Modal Submit Logs
                    //? Comment out entire line below to mute Modal Submit Logs
                    //caller.logger.info(`${baseLog} (Modal) ${modalSubmit.join(' ')}`);
                }

                break;
            case 'component':
                if (interaction.isComponent()) {
                    switch (interaction.data.component_type) {
                        case Constants.ComponentType.Button: {
                            //* Component: Button Logs
                            //? Comment out entire line below to mute Component: Button Logs
                            //caller.logger.info(`${baseLog} (Component: Button) custom_id:${interaction.data.custom_id}`);
                            break;
                        }
                        case Constants.ComponentType.StringSelect: {
                            const componentValues = interaction.data.values;

                            //* Component: Select Menu Logs
                            //? Comment out entire line below to mute Component: Select Menu Logs
                            // caller.logger.info(
                            //     `${baseLog} (Component: Select Menu) custom_id:${interaction.data.custom_id} values:${componentValues.join(' ')}`,
                            // );
                            break;
                        }
                    }
                }
                break;
        }
    }

    parseParams(options: Constants.APIApplicationCommandInteractionDataBasicOption[]) {
        let optionsString = '';

        options.forEach((option) => {
            optionsString += `${option.name}:${option.value} `;
        });

        return optionsString;
    }
}
