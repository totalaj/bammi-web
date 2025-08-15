cmake_minimum_required(VERSION 3.25 FATAL_ERROR)

# ---- Project ----

project(bammi_server LANGUAGES C)
set(CMAKE_C_STANDARD 11) # Requires C11 standard, but want to drop back to 99

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/deps/wsServer)

# ---- Create executable ----
# add your source files here
file(GLOB_RECURSE headers CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/include/*.h")
file(GLOB_RECURSE sources CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.c")
list(FILTER sources EXCLUDE REGEX "/src/.*test_.*\.c$")
add_executable(${PROJECT_NAME} ${headers} ${sources})

if(MSVC)
	target_compile_options(${PROJECT_NAME} PRIVATE /W4 /WX)
else()
	target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wmaybe-uninitialized -Wextra -Wpedantic -Werror)
endif()

# link to your dependencies' targets here
target_link_libraries(${PROJECT_NAME} ws)
