#pragma once
#include <stdint.h>
#include <stdbool.h>

#define NET_MAX_PACKET_SIZE 1024

typedef struct net_buf {
	uint32_t data[NET_MAX_PACKET_SIZE];
	uint64_t scratch;
	int32_t scratch_bits;
	int32_t word_index;

	//for reading
	uint32_t total_bits;
	int32_t num_bits_read;
} net_buf_t;

void net_buffer_flush(net_buf_t* buf);
void net_buffer_print(net_buf_t* buf);
void net_buffer_reset(net_buf_t* buf);

void net_read_int(net_buf_t* buf, int32_t* value, const char* name);
void net_write_int(net_buf_t* buf, int32_t value, const char* name);

void net_read_uint(net_buf_t* buf, uint32_t* value, const char* name);
void net_write_uint(net_buf_t* buf, uint32_t value, const char* name);

void net_read_bool(net_buf_t* buf, bool* value, const char* name);
void net_write_bool(net_buf_t* buf, bool value, const char* name);

void net_read_byte(net_buf_t* buf, int8_t* value, const char* name);
void net_write_byte(net_buf_t* buf, int8_t value, const char* name);

void net_read_ubyte(net_buf_t* buf, uint8_t* value, const char* name);
void net_write_ubyte(net_buf_t* buf, uint8_t value, const char* name);

void net_read_float(net_buf_t* buf, float* value, const char* name);
void net_write_float(net_buf_t* buf, float value, const char* name);

void net_read_double(net_buf_t* buf, double* value, const char* name);
void net_write_double(net_buf_t* buf, double value, const char* name);
