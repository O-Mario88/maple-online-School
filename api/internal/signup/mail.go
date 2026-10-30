package signup

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// Message is a plain-text email.
type Message struct {
	To, Subject, Body string
}

// Mailer sends email.
type Mailer interface {
	Send(ctx context.Context, m Message) error
}

// LogMailer writes emails to the log instead of sending them. It is for
// local development only, where the links are needed to test the flows.
type LogMailer struct{}

func (LogMailer) Send(_ context.Context, m Message) error {
	slog.Info("email not sent (development mailer)", "to", m.To, "subject", m.Subject, "body", m.Body)
	return nil
}

// SMTPMailer sends through an SMTP server with STARTTLS and PLAIN auth.
type SMTPMailer struct {
	Host, Port, Username, Password, From string
}

const smtpTimeout = 20 * time.Second

func (s SMTPMailer) Send(ctx context.Context, m Message) error {
	if strings.ContainsAny(m.To+m.Subject, "\r\n") {
		return fmt.Errorf("send email: header contains a line break")
	}
	addr := net.JoinHostPort(s.Host, s.Port)
	var auth smtp.Auth
	if s.Username != "" {
		auth = smtp.PlainAuth("", s.Username, s.Password, s.Host)
	}
	msg := strings.Join([]string{
		"From: Maple Online School <" + s.From + ">",
		"To: " + m.To,
		"Subject: " + m.Subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=utf-8",
		"",
		m.Body,
	}, "\r\n")
	done := make(chan error, 1)
	go func() { done <- smtp.SendMail(addr, auth, s.From, []string{m.To}, []byte(msg)) }()
	select {
	case err := <-done:
		if err != nil {
			return fmt.Errorf("send email: %w", err)
		}
		return nil
	case <-ctx.Done():
		return fmt.Errorf("send email: %w", ctx.Err())
	case <-time.After(smtpTimeout):
		return fmt.Errorf("send email: timed out after %s", smtpTimeout)
	}
}
