using System.Security.Cryptography;
using System.Text;

namespace AspAPI;

public static class Utils {
    public static string CreateSignature(string message, string secret) {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(messageBytes);
        return Base64UrlEncode(hash);
    }

    public static string Base64UrlEncode(string input) {
        return Base64UrlEncode(Encoding.UTF8.GetBytes(input));
    }

    public static string Base64UrlEncode(byte[] bytes) {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public static string Base64UrlDecode(string input) {
        string base64 = input
            .Replace('-', '+')
            .Replace('_', '/');

        switch (base64.Length % 4) {
            case 2: base64 += "=="; break;
            case 3: base64 += "="; break;
            case 0: break;
            default:
                throw new FormatException("Invalid Base64URL string.");
        }

        byte[] bytes = Convert.FromBase64String(base64);
        return Encoding.UTF8.GetString(bytes);
    }
}