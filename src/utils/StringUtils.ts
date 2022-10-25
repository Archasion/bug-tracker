export default class StringUtils {
    public static elipsify(str: string, maxLength: number): string {
        if (str.length > maxLength) return str.substring(0, maxLength - 3) + "...";
        return str;
    }
}