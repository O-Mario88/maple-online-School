// Package legacy forwards requests the Go service doesn't handle yet to the
// Django API, so clients talk to one address while modules move over.
package legacy

import (
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
)

// NewProxy returns a handler that forwards to the Django API at target.
func NewProxy(target string) (http.Handler, error) {
	u, err := url.Parse(target)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return nil, fmt.Errorf("invalid legacy API URL %q", target)
	}
	p := &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(u)
			r.SetXForwarded()
			r.Out.Host = u.Host
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			slog.Error("legacy proxy", "path", r.URL.Path, "err", err)
			httpx.WriteError(w, http.StatusBadGateway, "upstream_unavailable", "This part of Maple is temporarily unavailable.")
		},
	}
	return p, nil
}
