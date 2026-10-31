package signup

import (
	"context"
	"fmt"
	"log/slog"
	"time"
)

// Inviter emails people a school has invited to join its staff.
type Inviter struct {
	Links  Signer
	Mail   Mailer
	AppURL string
	Now    func() time.Time
}

func (i Inviter) now() time.Time {
	if i.Now != nil {
		return i.Now()
	}
	return time.Now()
}

// SendInvite tells someone they were invited. Someone new gets a link to
// choose their password (good for a week); someone with an account is asked
// to open Maple and accept. A failed send is logged: the school can invite
// again, and the person can use "Forgot password".
func (i Inviter) SendInvite(ctx context.Context, acct Account, school, role string, isNew bool) {
	m := Message{To: acct.Email, Subject: "You're invited to " + school + " on Maple"}
	if isNew {
		link := fmt.Sprintf("%s/reset-password?token=%s", i.AppURL, i.Links.Make(Invite, acct, i.now()))
		m.Body = fmt.Sprintf("Hi,\n\n%s has invited you to join as a %s on Maple Online School. "+
			"Choose a password to get started (this link works for 7 days):\n\n%s\n\n"+
			"If you weren't expecting this, ignore this email.\n", school, role, link)
	} else {
		m.Body = fmt.Sprintf("Hi %s,\n\n%s has invited you to join as a %s on Maple Online School. "+
			"Sign in at %s and accept the invitation from your school page.\n\n"+
			"If you weren't expecting this, ignore this email.\n", acct.FullName, school, role, i.AppURL)
	}
	if err := i.Mail.Send(ctx, m); err != nil {
		slog.Error("signup: send invitation", "err", err)
	}
}
