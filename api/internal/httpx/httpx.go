// Package httpx holds small HTTP helpers shared by every module.
package httpx

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
)

const maxBodyBytes = 1 << 20 // 1 MB is plenty for JSON requests

// WriteJSON writes v as a JSON response with the given status.
func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		slog.Error("write json response", "err", err)
	}
}

// Error is the error body. It keeps DRF's "detail" key so existing clients
// can read errors from either backend the same way.
type Error struct {
	Detail string `json:"detail"`
	Code   string `json:"code,omitempty"`
}

// WriteError writes an error body.
func WriteError(w http.ResponseWriter, status int, code, detail string) {
	WriteJSON(w, status, Error{Detail: detail, Code: code})
}

// DecodeJSON reads a JSON body into dst, refusing unknown fields and oversized bodies.
func DecodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(io.LimitReader(r.Body, maxBodyBytes))
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return errors.New("request body must be valid JSON")
	}
	return nil
}
