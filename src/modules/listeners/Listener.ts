export default abstract class EventListener {
    name: string;
    once: boolean;

    protected constructor(data: { name: string; once: boolean; }) {
        this.name = data.name;
        this.once = data.once;
    }
}