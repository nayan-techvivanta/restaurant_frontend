
import EscPosEncoder from "esc-pos-encoder";

const LINE_WIDTH = 32;
const ITEM_DESC_MAX = 18;

/* ===== LAYOUT HELPERS ===== */
const centerText = (text = "") =>
    text
        .toString()
        .padStart(Math.floor((LINE_WIDTH + text.length) / 2))
        .padEnd(LINE_WIDTH);

const leftRight = (left = "", right = "") =>
    left.toString().padEnd(LINE_WIDTH - right.length) + right;

const separator = () => "-".repeat(LINE_WIDTH);

/* ===== MAIN FUNCTION ===== */
export const generateReceipt = (orderData) => {
    const encoder = new EscPosEncoder();
    const r = orderData.restaurant || {};

    const receipt = encoder.initialize().codepage("cp437");

    /* ===== HEADER (PERFECT CENTER) ===== */
    receipt.align("left").bold(true);
    receipt.line((r.name || "HOTEL").toUpperCase());
    receipt.bold(false);

    // Address and city JOINED on same line (also left)
    if (r.address || r.city) {
        const addressCity = [];
        if (r.address) addressCity.push(r.address);
        if (r.city) addressCity.push(r.city);
        receipt.line(addressCity.join(", "));
    }
    /* ===== TOKEN (BIGGER + BOLDER + CENTER) ===== */

    receipt.align("left").bold(true);
    receipt.size(2, 2);
    receipt.line(`TOKEN NO: ${orderData.token}`);
    receipt.size(1, 1);
    receipt.bold(false);
    receipt.line(separator());
    /* ===== BILL INFO ===== */

    receipt.align("left");
    receipt.line(leftRight("Bill No:", String(orderData.id)));
    receipt.line(leftRight("Date:", formatDate(orderData.created_at)));

    receipt.line(separator());

    /* ===== ITEM HEADER ===== */
    receipt.line(
        leftRight(
            "DESC  X QTY",
            "AMT"
        )
    );
    receipt.line(separator());

    /* ===== ITEMS (QTY JOINED WITH LAST NAME LINE) ===== */
    orderData.items.forEach((item) => {
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const amount = price * qty;

        const nameLines = wrapText(item.name, ITEM_DESC_MAX).split("\n");

        for (let i = 0; i < nameLines.length - 1; i++) {
            receipt.line(leftRight(nameLines[i], ""));
        }

        if (nameLines.length > 0) {
            const lastNameLine = nameLines[nameLines.length - 1];
            receipt.line(
                leftRight(
                    `${lastNameLine} x ${qty}`,
                    amount.toString()
                )
            );
        }
    });

    receipt.line(separator());

    /* ===== NET TOTAL (BIGGER + BOLD) ===== */
    receipt.bold(true);
    receipt.size("double", "double");
    receipt.line(
        leftRight("NET TOTAL", `Rs. ${orderData.grand_total}`)
    );
    receipt.size("normal", "normal");
    receipt.bold(false);

    receipt.line(separator());

    /* ===== FOOTER (PERFECT CENTERED) ===== */
    receipt.align("left");
    receipt.bold(true);
    receipt.line("Thanks for Visit Again!");
    receipt.bold(false);

    receipt.newline().cut();

    return receipt.encode();
};

/* ===== HELPERS ===== */
function wrapText(text = "", maxChars) {
    const words = text.split(" ");
    let line = "";
    const lines = [];

    words.forEach((word) => {
        if ((line + word).length <= maxChars) {
            line += word + " ";
        } else {
            lines.push(line.trim());
            line = word + " ";
        }
    });

    if (line) lines.push(line.trim());
    return lines.join("\n");
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime())
        ? new Date().toISOString().slice(0, 10)
        : d.toISOString().slice(0, 10);
}