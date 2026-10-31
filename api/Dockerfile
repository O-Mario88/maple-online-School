# syntax=docker/dockerfile:1.7
# The Maple API: one static Go binary. It builds and migrates its own schema
# on start, so the image needs nothing but a Postgres URL and secrets.

FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/maple-api ./cmd/maple-api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/maple-api /maple-api
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/maple-api"]
