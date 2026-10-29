# Go API image: a static binary on a minimal base.
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
