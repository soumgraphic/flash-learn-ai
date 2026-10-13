"""Domain Exceptions for FlashLearn AI.

Educational Notes for Students:
------------------------------
1. Decoupling: Services raise pure Python domain exceptions, never HTTP exceptions.
   This keeps domain logic independent of any web framework, protocol, or transport layer.
2. Centralized Mapping: The FastAPI presentation layer / exception handlers catch these
   exceptions and translate them into standard HTTP status codes (400, 401, 403, 404).
"""


class FlashLearnDomainError(Exception):
    """Base domain exception for all application-specific errors."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class UserAlreadyExistsError(FlashLearnDomainError):
    """Raised when an email registration conflicts with an existing account."""

    pass


class InvalidCredentialsError(FlashLearnDomainError):
    """Raised when authentication credentials (email/password) are incorrect."""

    pass


class InactiveUserError(FlashLearnDomainError):
    """Raised when an account is disabled or suspended."""

    pass


class ResourceNotFoundError(FlashLearnDomainError):
    """Raised when an entity (course, flashcard, user) does not exist."""

    pass


class AIServiceUnavailableError(FlashLearnDomainError):
    """Raised when external AI providers fail to return valid payloads."""

    pass
