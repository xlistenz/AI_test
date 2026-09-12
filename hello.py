import tkinter as tk


BACKGROUND = "#f5f1e8"
TEXT = "#202124"
ACCENT = "#d85b43"
ACCENT_DARK = "#b94732"
PANEL = "#fffdf8"


def main():
    def check_answer(answer):
        if answer == 1:
            result_label.config(text="答案錯誤", fg=ACCENT)
        elif answer == 2:
            result_label.config(text="Bingo！答對囉", fg="#2f7d5a")
        else:
            result_label.config(text="請選擇一個答案", fg=ACCENT)

    def reset_question():
        result_label.config(text="等待你的選擇...", fg="#77736b")

    root = tk.Tk()
    root.title("快問快答")
    root.geometry("560x420")
    root.minsize(480, 360)
    root.configure(bg=BACKGROUND)

    header = tk.Frame(root, bg=ACCENT, height=110)
    header.pack(fill="x")
    header.pack_propagate(False)

    tk.Label(
        header,
        text="快問快答",
        font=("Microsoft JhengHei UI", 26, "bold"),
        fg="white",
        bg=ACCENT,
    ).pack(anchor="w", padx=36, pady=(22, 0))

    tk.Label(
        header,
        text="選出你心中的答案吧",
        font=("Microsoft JhengHei UI", 11),
        fg="#ffe9df",
        bg=ACCENT,
    ).pack(anchor="w", padx=38)

    content = tk.Frame(root, bg=BACKGROUND)
    content.pack(fill="both", expand=True, padx=36, pady=28)

    tk.Label(
        content,
        text="第 1 題",
        font=("Microsoft JhengHei UI", 10, "bold"),
        fg=ACCENT,
        bg=BACKGROUND,
    ).pack(anchor="w")

    tk.Label(
        content,
        text="楊子徹帥嗎？",
        font=("Microsoft JhengHei UI", 22, "bold"),
        fg=TEXT,
        bg=BACKGROUND,
    ).pack(anchor="w", pady=(4, 20))

    options = tk.Frame(content, bg=BACKGROUND)
    options.pack(fill="x")

    for label, answer in (("1　帥", 1), ("2　不帥", 2)):
        tk.Button(
            options,
            text=label,
            command=lambda selected=answer: check_answer(selected),
            font=("Microsoft JhengHei UI", 13, "bold"),
            fg=TEXT,
            bg=PANEL,
            activebackground="#f0e4d4",
            activeforeground=TEXT,
            relief="flat",
            bd=0,
            cursor="hand2",
            padx=18,
            pady=13,
        ).pack(side="left", fill="x", expand=True, padx=(0, 10) if answer == 1 else (10, 0))

    result_label = tk.Label(
        content,
        text="等待你的選擇...",
        font=("Microsoft JhengHei UI", 14, "bold"),
        fg="#77736b",
        bg=BACKGROUND,
    )
    result_label.pack(pady=(30, 18))

    tk.Button(
        content,
        text="重新作答",
        command=reset_question,
        font=("Microsoft JhengHei UI", 10),
        fg="white",
        bg=ACCENT,
        activebackground=ACCENT_DARK,
        activeforeground="white",
        relief="flat",
        bd=0,
        cursor="hand2",
        padx=18,
        pady=8,
    ).pack()

    root.mainloop()


if __name__ == "__main__":
    main()