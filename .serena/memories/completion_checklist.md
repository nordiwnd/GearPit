# Task Completion Checklist

When finishing a task, ensure:

1. **ARM64 Compatibility**: Verify no AMD64-only dependencies or binaries are introduced.
2. **Clean Architecture**: Confirm domain logic is isolated from infrastructure/transport details.
3. **Frontend Consistency**: Verify UI matches `shadcn/ui` patterns and Tailwind usage.
4. **Tests**: Run relevant unit tests (`go test ./...` for backend).
5. **Linting**: Ensure code is linted (standard Go vet, ESLint for frontend).
