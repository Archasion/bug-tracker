export default class StringUtils {
    public static elipsify(text: string, maxLength: number): string {
        if (text.length > maxLength)
            return text.substring(0, maxLength - 3) + "...";

        return text;
    }
}